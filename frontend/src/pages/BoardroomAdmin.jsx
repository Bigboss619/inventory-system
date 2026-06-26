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
  FiX
} from 'react-icons/fi';
import {
  getBoardroomBookings,
  updateBoardroomBooking
} from '../services/api';

const BoardroomAdmin = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

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
                      {booking.status === 'Pending' && (
                        <div className="flex gap-2">
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
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardroomAdmin;