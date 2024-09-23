
export default function GroupVideoCall() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-wrap justify-center items-center gap-4 p-4">
        {['User 1', 'User 2', 'User 3', 'User 4', 'User 5', 'User 6'].map((user, index) => (
          <div key={index} className="w-1/3 h-1/3 bg-black relative">
            <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-2 rounded">
              {user}
            </div>
          </div>
        ))}
      </div>
      <aside className="w-64 bg-white p-4 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Participants</h2>
        <ul className="space-y-3">
          {['User 1', 'User 2', 'User 3', 'User 4', 'User 5', 'User 6'].map((user) => (
            <li key={user} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-medium">{user}</h3>
              </div>
            </li>
          ))}
        </ul>
        <button className="w-full bg-red-500 text-white py-2 mt-6 rounded hover:bg-red-600">End Call</button>
      </aside>
    </div>
  );
}
