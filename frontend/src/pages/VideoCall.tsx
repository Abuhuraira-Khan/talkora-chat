
export default function VideoCall() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex justify-center items-center">
        <div className="w-3/4 h-3/4 bg-black relative">
          <div className="absolute bottom-4 right-4 w-32 h-32 bg-gray-800"></div>
        </div>
      </div>
      <aside className="w-64 bg-white p-4 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Participants</h2>
        <ul className="space-y-3">
          {['John Doe', 'Jane Smith'].map((name) => (
            <li key={name} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-medium">{name}</h3>
              </div>
            </li>
          ))}
        </ul>
        <button className="w-full bg-red-500 text-white py-2 mt-6 rounded hover:bg-red-600">End Call</button>
      </aside>
    </div>
  );
}
