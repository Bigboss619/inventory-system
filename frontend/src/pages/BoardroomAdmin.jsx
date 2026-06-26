import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiHome,
  FiCheck,
  FiX,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';
import {
  getBoardroomBookings,
  updateBoardroomBooking,
  cancelBoardroomBooking,
  getBoardroomBookingById
} from '../services/api';

const BoardroomAdmin = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    meetingTitle: '',
    purpose: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    expectedAttendees: 1,
    refreshments: 'No',
    projector: 'No',
    notes: ''
  });

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'pending') {
        params.status = 'Pending';
      } else if (filter === 'confirmed') {
        params.status = 'Confirmed';
      } else if (filter === 'cancelled') {
        params.status = 'Cancelled';
      }

      const data = await getBoardroomBookings(params);
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id);
    try {
      await updateBoardroomBooking(id, { status });
      toast.success(`Booking ${status === 'Confirmed' ? 'approved' : 'rejected'} successfully`);
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to update booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async (id) => {
    try {
      const booking = await getBoardroomBookingById(id);
      setSelectedBooking(booking);
      setEditFormData({
        meetingTitle: booking.meeting_title || '',
        purpose: booking.purpose || '',
        bookingDate: booking.booking_date || '',
        startTime: booking.start_time || '',
        endTime: booking.end_time || '',
        expectedAttendees: booking.expected_attendees || 1,
        refreshments: booking.refreshments || 'No',
        projector: booking.projector || 'No',
        notes: booking.notes || ''
      });
      setEditModalOpen(true);
    } catch (error) {
      toast.error('Failed to load booking details');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedBooking) return;
    setActionLoading('saving');
    try {
      await updateBoardroomBooking(selectedBooking.id, {
        meetingTitle: editFormData.meetingTitle,
        purpose: editFormData.purpose,
        bookingDate: editFormData.bookingDate,
        startTime: editFormData.startTime,
        endTime: editFormData.endTime,
        expectedAttendees: editFormData.expectedAttendees,
        refreshments: editFormData.refreshments,
        projector: editFormData.projector,
        notes: editFormData.notes
      });
      toast.success('Booking updated successfully');
      setEditModalOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to update booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    setActionLoading(id);
    try {
      await cancelBoardroomBooking(id);
      toast.success('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to delete booking');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      booking.meeting_title?.toLowerCase().includes(term) ||
      booking.requested_by?.toLowerCase().includes(term) ||
      booking.department_name?.toLowerCase().includes(term)
    );
  });

  const pendingCount = bookings.filter(b => b.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <FiHome className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Boardroom Management</h1>
            <p className="text-blue-100">Approve or reject booking requests</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, name, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'confirmed', label: 'Approved' },
              { key: 'cancelled', label: 'Rejected' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No bookings found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === 'pending' ? 'No pending bookings to review' : 'No bookings match your filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-sm font-semibold text-gray-600 px-6 py-4">Meeting</th>
                  <th className="text-left text-sm font-semibold text-gray-600 px-6 py-4">Requested By</th>
                  <th className="text-left text-sm font-semibold text-gray-600 px-6 py-4">Date & Time</th>
                  <th className="text-left text-sm font-semibold text-gray-600 px-6 py-4">Attendees</th>
                  <th className="text-left text-sm font-semibold text-gray-600 px-6 py-4">Status</th>
                  <th className="text-left text-sm font-semibold text-gray-600 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{booking.meeting_title}</div>
                      {booking.purpose && (
                        <div className="text-sm text-gray-500 mt-0.5 line-clamp-1">{booking.purpose}</div>
                      )}
                      <div className="flex gap-2 mt-1">
                        {booking.refreshments === 'Yes' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Refreshments</span>
                        )}
                        {booking.projector === 'Yes' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Projector</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{booking.requested_by}</div>
                      <div className="text-sm text-gray-500">{booking.department_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">{formatDate(booking.booking_date)}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiClock className="w-3.5 h-3.5" />
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <FiUsers className="w-4 h-4" />
                        {booking.expected_attendees}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status === 'Pending' && <FiAlertCircle className="w-3.5 h-3.5" />}
                        {booking.status === 'Confirmed' && <FiCheckCircle className="w-3.5 h-3.5" />}
                        {booking.status === 'Cancelled' && <FiXCircle className="w-3.5 h-3.5" />}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {booking.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}
                              disabled={actionLoading === booking.id}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === booking.id ? (
                                <FiCheck className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiCheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
                              disabled={actionLoading === booking.id}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              {actionLoading === booking.id ? (
                                <FiX className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiXCircle className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                        {booking.status === 'Confirmed' && (
                          <>
                            <button
                              onClick={() => handleEdit(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Booking Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Edit Booking</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Title</label>
                <input
                  type="text"
                  value={editFormData.meetingTitle}
                  onChange={(e) => setEditFormData({ ...editFormData, meetingTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
                <textarea
                  value={editFormData.purpose}
                  onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={editFormData.bookingDate}
                    onChange={(e) => setEditFormData({ ...editFormData, bookingDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Attendees</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.expectedAttendees}
                    onChange={(e) => setEditFormData({ ...editFormData, expectedAttendees: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={editFormData.startTime?.substring(0, 5)}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={editFormData.endTime?.substring(0, 5)}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Refreshments</label>
                  <select
                    value={editFormData.refreshments}
                    onChange={(e) => setEditFormData({ ...editFormData, refreshments: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Projector</label>
                  <select
                    value={editFormData.projector}
                    onChange={(e) => setEditFormData({ ...editFormData, projector: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading === 'saving'}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'saving' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardroomAdmin;