import { FiUser } from 'react-icons/fi';

const ProfileCard = ({ userData }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <FiUser className="w-12 h-12 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {userData.firstName} {userData.lastName}
            </h2>
            <p className="text-gray-500">{userData.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;