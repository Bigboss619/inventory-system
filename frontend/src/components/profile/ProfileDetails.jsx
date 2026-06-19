import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiSettings } from 'react-icons/fi';

const ProfileDetails = ({ userData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FiUser className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Full Name</p>
          <p className="font-medium text-gray-900">
            {userData.firstName} {userData.lastName}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FiMail className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium text-gray-900">{userData.email}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FiPhone className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium text-gray-900">{userData.phone}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FiMapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium text-gray-900">{userData.address}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FiSettings className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-medium text-gray-900">{userData.role}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FiCalendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Joined Date</p>
          <p className="font-medium text-gray-900">{userData.created_at}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;