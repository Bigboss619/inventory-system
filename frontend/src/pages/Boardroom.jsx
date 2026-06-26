import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiFileText,
  FiPlus,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2
} from 'react-icons/fi';
import {
  getBoardroomBookings,
  createBoardroomBooking,
  cancelBoardroomBooking,
  getAvailableSlots
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const Boardroom = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, [selectedDate]);

  useEffect(() => {
    if (modalOpen) {
      fetchAvailableSlots();
    }
  }, [selectedDate, modalOpen]);

  const fetchBookings = async () => {
    setFetching(true);
    try {
      const data = await getBoardroomBookings({ date: selectedDate });
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setFetching(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const slots = await getAvailableSlots(selectedDate);
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (error) {
      setAvailableSlots([]);
    }
  };

  const handleCreateBooking = async (formData) => {
    setLoading(true);
    try {
      await createBoardroomBooking(formData);
      toast.success('Booking created successfully');
      fetchBookings();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await cancelBoardroomBooking(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Boardroom Booking</h1>
          <p className="text-gray-600">Book and manage boardroom reservations</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          New Booking
        </button>
      </div>

      {/* Calendar and Bookings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => (
              <button
                key={index}
                disabled={!date}
                onClick={() => date && setSelectedDate(date.toISOString().split('T')[0])}
                className={`
                  h-12 rounded-lg transition-colors flex items-center justify-center text-sm
                  ${!date ? 'invisible' : ''}
                  ${isSelected(date) && 'bg-blue-600 text-white'}
                  ${isToday(date) && !isSelected(date) && 'bg-blue-100 text-blue-600 font-semibold'}
                  ${!isSelected(date) && !isToday(date) && 'hover:bg-gray-100 text-gray-700'}
                `}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings for selected date */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiCalendar className="w-5 h-5" />
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </h3>

          {fetching ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bookings for this date
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <FiClock className="w-4 h-4" />
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </div>
                      <p className="font-medium text-gray-800">{booking.purpose}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <FiUsers className="w-4 h-4" />
                        {booking.attendees} attendee{booking.attendees > 1 ? 's' : ''}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        By: {booking.user_name}
                      </p>
                    </div>
                    {(user?.id === booking.user_id || user?.role === 'Super Admin') && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel booking"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {modalOpen && (
        <BookingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleCreateBooking}
          selectedDate={selectedDate}
          availableSlots={availableSlots}
          loading={loading}
        />
      )}
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, onSave, selectedDate, availableSlots, loading }) => {
  const [formData, setFormData] = useState({
    bookingDate: selectedDate,
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, bookingDate: selectedDate }));
  }, [selectedDate]);

  useEffect(() => {
    if (formData.startTime && availableSlots.length > 0) {
      const slot = availableSlots.find(s => s.start === formData.startTime);
      if (slot) {
        setFormData(prev => ({ ...prev, endTime: slot.end }));
      }
    }
  }, [formData.startTime, availableSlots]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">New Booking</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.bookingDate}
              onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <select
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value, endTime: '' })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select time</option>
              {availableSlots.map((slot, index) => (
                <option key={index} value={slot.start}>
                  {slot.start.slice(0, 5)}
                </option>
              ))}
            </select>
            {availableSlots.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No available slots for this date
              </p>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Meeting purpose or title"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Attendees
            </label>
            <input
              type="number"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 1 })}
              min={1}
              max={20}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availableSlots.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Boardroom;