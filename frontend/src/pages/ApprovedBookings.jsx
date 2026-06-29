import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiSearch,
  FiMonitor,
  FiCoffee
} from 'react-icons/fi';
import { getBoardroomBookings } from '../services/api';

const ApprovedBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApprovedBookings();
  }, []);

  const fetchApprovedBookings = async () => {
    setLoading(true);
    try {
      const data = await getBoardroomBookings({ status: 'Confirmed' });
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
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

  // Sort bookings by date (earliest first)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(a.booking_date + ' ' + a.start_time);
    const dateB = new Date(b.booking_date + ' ' + b.start_time);
    return dateA - dateB;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <FiCalendar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Approved Bookings</h1>
            <p className="text-green-100">View all confirmed boardroom bookings</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, name, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : sortedBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No approved bookings found</p>
            <p className="text-sm text-gray-400 mt-1">All confirmed bookings will appear here</p>
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
                  <th className="text-left text-sm font-semibold text-gray-600 px-6 py-4">Resources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{booking.meeting_title}</div>
                      {booking.purpose && (
                        <div className="text-sm text-gray-500 mt-0.5 line-clamp-1">{booking.purpose}</div>
                      )}
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
                      <div className="flex gap-2">
                        {booking.refreshments === 'Yes' && (
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            <FiCoffee className="w-3 h-3" />
                            Refreshments
                          </span>
                        )}
                        {booking.projector === 'Yes' && (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            <FiMonitor className="w-3 h-3" />
                            Projector
                          </span>
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
    </div>
  );
};

export default ApprovedBookings;