export default function DashboardCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

