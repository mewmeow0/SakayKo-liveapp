const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

// In-memory demo store: resets if the server restarts. Do not use for real transport bookings.
const bookings = new Map();
const onlineUsers = new Map();
let nextId = 1001;
function safeUser(u) { return { id: u.id, name: u.name, role: u.role, online: true }; }
function snapshot() {
  return {
    bookings: [...bookings.values()].sort((a,b) => b.createdAt - a.createdAt),
    users: [...onlineUsers.values()].map(safeUser)
  };
}
function broadcast() { io.emit('state', snapshot()); }
io.on('connection', socket => {
  socket.emit('state', snapshot());
  socket.on('join', payload => {
    if (!payload || typeof payload.name !== 'string' || !['passenger','driver'].includes(payload.role)) return;
    const name = payload.name.trim().slice(0,40);
    if (!name) return;
    socket.data.user = { id: socket.id, name, role: payload.role };
    onlineUsers.set(socket.id, socket.data.user);
    socket.emit('joined', safeUser(socket.data.user));
    broadcast();
  });
  socket.on('createBooking', payload => {
    const user = socket.data.user;
    if (!user || user.role !== 'passenger') return socket.emit('notice', 'Please join as a passenger to book a ride.');
    const pickup = String(payload?.pickup || '').trim().slice(0,100);
    const destination = String(payload?.destination || '').trim().slice(0,100);
    const kind = payload?.kind === 'scheduled' ? 'scheduled' : 'immediate';
    const schedule = String(payload?.schedule || '').slice(0,50);
    const passengers = Math.max(1, Math.min(6, Number(payload?.passengers) || 1));
    const fare = Math.max(15, Math.min(10000, Math.round(Number(payload?.fare) || 15)));
    if (!pickup || !destination || pickup.toLowerCase() === destination.toLowerCase()) return socket.emit('notice', 'Enter different pickup and destination locations.');
    if (kind === 'scheduled' && !schedule) return socket.emit('notice', 'Choose a date and time for your scheduled ride.');
    const booking = { id: String(nextId++), passengerId: socket.id, passengerName: user.name, pickup, destination, kind, schedule, passengers, fare, status: 'pending', driverId: null, driverName: null, createdAt: Date.now(), updatedAt: Date.now() };
    bookings.set(booking.id, booking);
    broadcast();
    socket.emit('notice', `Booking #${booking.id} sent to available drivers.`);
  });
  socket.on('bookingAction', payload => {
    const user = socket.data.user;
    if (!user || !payload || !bookings.has(String(payload.id))) return;
    const b = bookings.get(String(payload.id));
    const action = payload.action;
    if (action === 'accept' && user.role === 'driver' && b.status === 'pending') {
      b.status = 'accepted'; b.driverId = socket.id; b.driverName = user.name; b.updatedAt = Date.now();
    } else if (action === 'cancel' && user.role === 'passenger' && b.passengerId === socket.id && b.status === 'pending') {
      b.status = 'cancelled'; b.updatedAt = Date.now();
    } else if (action === 'cancelAccepted' && user.role === 'driver' && b.driverId === socket.id && b.status === 'accepted') {
      b.status = 'cancelled'; b.updatedAt = Date.now();
    } else if (action === 'complete' && user.role === 'driver' && b.driverId === socket.id && b.status === 'accepted') {
      b.status = 'completed'; b.updatedAt = Date.now();
    } else return;
    broadcast();
    io.emit('notice', `Booking #${b.id} is now ${b.status}.`);
  });
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    broadcast();
  });
});
server.listen(PORT, () => console.log(`SakayKo Live running on port ${PORT}`));
