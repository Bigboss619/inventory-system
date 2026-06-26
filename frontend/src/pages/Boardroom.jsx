import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiPlus,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMonitor,
  FiCoffee,
  FiCheckCircle,
  FiAlertCircle,
  FiHome
} from 'react-icons/fi';
import {
  getBoardroomBookings,
  createBoardroomBooking,
  getAvailableSlots,
  getStaff
} from '../services/api';

// Helper to format date as YYYY-MM-DD in local timezone (not UTC)
const formatDateToLocal = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Boardroom = () => {
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatDateToLocal(new Date()));
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
      toast.success('Booking submitted successfully!');
      fetchBookings();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
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
    return formatDateToLocal(date) === selectedDate;
  };

  const isPast = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiHome className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Boardroom Booking</h1>
                <p className="text-blue-100">Reserve the boardroom for your meetings</p>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <FiPlus className="w-5 h-5" />
              Book Now
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiClock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Working Hours</p>
              <p className="font-semibold text-gray-800">8:00 AM - 6:00 PM</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-semibold text-gray-800">Up to 20 people</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiMonitor className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Amenities</p>
              <p className="font-semibold text-gray-800">Projector & Refreshments</p>
            </div>
          </div>
        </div>

        {/* Calendar and Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border-0 p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">{monthName}</h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {generateCalendarDays().map((date, index) => (
                <button
                  key={index}
                  disabled={!date || isPast(date)}
                  onClick={() => date && setSelectedDate(formatDateToLocal(date))}
                  className={`
                    h-14 rounded-xl transition-all flex flex-col items-center justify-center text-sm font-medium
                    ${!date ? 'invisible' : ''}
                    ${isPast(date) && 'opacity-30 cursor-not-allowed'}
                    ${isSelected(date) && 'bg-blue-600 text-white shadow-lg'}
                    ${isToday(date) && !isSelected(date) && 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-300'}
                    ${!isSelected(date) && !isToday(date) && !isPast(date) && 'hover:bg-gray-100 text-gray-700'}
                  `}
                >
                  <span>{date?.getDate()}</span>
                  {date && bookings.find(b => b.booking_date === formatDateToLocal(date)) && !isSelected(date) && (
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings for selected date */}
          <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiCalendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </h3>
            </div>

            {fetching ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No bookings for this date</p>
                <p className="text-sm text-gray-400 mt-1">The boardroom is available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div
                    key={booking.id}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-800">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{booking.meeting_title}</h4>
                    {booking.purpose && (
                      <p className="text-sm text-gray-500 mb-2">{booking.purpose}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
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
                    <div className="mt-2 pt-2 border-t border-blue-100">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">{booking.requested_by}</span>
                        <span className="text-gray-400"> • {booking.department_name}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiHome className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Book Boardroom</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Requested By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Requested By <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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

          {/* Department */}
          {selectedStaff && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="block text-sm text-gray-500 mb-1">Department</label>
              <p className="font-semibold text-gray-800">{selectedStaff.department_name}</p>
            </div>
          )}

          {/* Meeting Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.meetingTitle}
              onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })}
              placeholder="e.g., Weekly Team Meeting"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Brief description of the meeting"
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.bookingDate}
                onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={formatDateToLocal(new Date())}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value, endTime: '' })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select</option>
                {availableSlots.map((slot, index) => (
                  <option key={index} value={slot.start}>
                    {slot.start.slice(0, 5)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.startTime}
              >
                <option value="">Select</option>
                {availableSlots
                  .filter(slot => slot.start > formData.startTime)
                  .map((slot, index) => (
                    <option key={index} value={slot.end}>
                      {slot.end.slice(0, 5)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {availableSlots.length === 0 && (
            <div className="bg-yellow-50 p-4 rounded-xl flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700">No available slots for this date</p>
            </div>
          )}

          {/* Attendees */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expected Attendees <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.expectedAttendees}
              onChange={(e) => setFormData({ ...formData, expectedAttendees: parseInt(e.target.value) || 1 })}
              min={1}
              max={20}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Refreshments</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="refreshments"
                    value="No"
                    checked={formData.refreshments === 'No'}
                    onChange={(e) => setFormData({ ...formData, refreshments: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-600">No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="refreshments"
                    value="Yes"
                    checked={formData.refreshments === 'Yes'}
                    onChange={(e) => setFormData({ ...formData, refreshments: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-600">Yes</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Projector</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="projector"
                    value="No"
                    checked={formData.projector === 'No'}
                    onChange={(e) => setFormData({ ...formData, projector: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-600">No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="projector"
                    value="Yes"
                    checked={formData.projector === 'Yes'}
                    onChange={(e) => setFormData({ ...formData, projector: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-600">Yes</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information"
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availableSlots.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-medium disabled:opacity-50 shadow-lg"
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