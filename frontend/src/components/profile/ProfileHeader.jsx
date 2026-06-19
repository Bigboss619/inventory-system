import { FiEdit2 } from 'react-icons/fi';

const ProfileHeader = ({ isEditing, onEdit }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">Manage your account settings</p>
      </div>
      {!isEditing && (
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiEdit2 className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;