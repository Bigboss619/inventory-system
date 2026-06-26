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
  FiTrash2,
  FiMonitor,
  FiCoffee
} from 'react-icons/fi';
import {
  getBoardroomBookings,
  createBoardroomBooking,
  cancelBoardroomBooking,
  getAvailableSlots,
  getStaff
} from '../services/api';

const Boardroom = () => {
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchBookings();
    fetchStaff();
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

  const fetchStaff = async () => {
    try {
      const data = await getStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      setStaff([]);
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
      toast.success('Booking submitted successfully');
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

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

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
          <p className="text-gray-600">Book the boardroom for your meeting</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Book Now
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

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

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
                      <p className="font-medium text-gray-800">{booking.meeting_title}</p>
                      <p className="text-sm text-gray-500 mt-1">{booking.purpose}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <FiUsers className="w-4 h-4" />
                          {booking.expected_attendees}
                        </span>
                        {booking.refreshments === 'Yes' && (
                          <span className="flex items-center gap-1">
                            <FiCoffee className="w-4 h-4" />
                            Refreshments
                          </span>
                        )}
                        {booking.projector === 'Yes' && (
                          <span className="flex items-center gap-1">
                            <FiMonitor className="w-4 h-4" />
                            Projector
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        By: {booking.requested_by} ({booking.department_name})
                      </p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded mt-2 ${
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
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
          staff={staff}
          loading={loading}
        />
      )}
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, onSave, selectedDate, availableSlots, staff, loading }) => {
  const [formData, setFormData] = useState({
    staffId: '',
    meetingTitle: '',
    purpose: '',
    bookingDate: selectedDate,
    startTime: '',
    endTime: '',
    expectedAttendees: 1,
    refreshments: 'No',
    projector: 'No',
    notes: ''
  });

  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    setFormData(prev => ({ ...prev, bookingDate: selectedDate }));
  }, [selectedDate]);

  useEffect(() => {
    if (formData.staffId && staff.length > 0) {
      const found = staff.find(s => s.id === parseInt(formData.staffId));
      setSelectedStaff(found || null);
    } else {
      setSelectedStaff(null);
    }
  }, [formData.staffId, staff]);

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
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Book Boardroom</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Requested By (Staff Dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requested By <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select your name</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Department (Auto-display) */}
          {selectedStaff && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={selectedStaff.department_name || ''}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                readOnly
              />
            </div>
          )}

          {/* Meeting Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.meetingTitle}
              onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })}
              placeholder="e.g., Weekly Team Meeting"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Brief description of the meeting"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
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
              Start Time <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value, endTime: '' })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select start time</option>
              {availableSlots.map((slot, index) => (
                <option key={index} value={slot.start}>
                  {slot.start.slice(0, 5)}
                </option>
              ))}
            </select>
            {availableSlots.length === 0 && (
              <p className="text-sm text-orange-500 mt-1">
                No available slots for this date
              </p>
            )}
          </div>

          {/* Expected Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Attendees <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.expectedAttendees}
              onChange={(e) => setFormData({ ...formData, expectedAttendees: parseInt(e.target.value) || 1 })}
              min={1}
              max={20}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Refreshments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Refreshments Required?</label>
            <select
              value={formData.refreshments}
              onChange={(e) => setFormData({ ...formData, refreshments: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {/* Projector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projector Needed?</label>
            <select
              value={formData.projector}
              onChange={(e) => setFormData({ ...formData, projector: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              {loading ? 'Submitting...' : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Boardroom;