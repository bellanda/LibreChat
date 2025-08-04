

function LegendItem({ color, text, emoji }) {
    return (
        <div className="flex items-center gap-2">
            <span aria-hidden="true">{emoji}</span>
            <p className={`text-${color}`}>{text}</p>
        </div>
    );
  }
  
export function Legend({ legendItems }: { legendItems: any[] }) {
    return (
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 my-8 p-4 bg-gray-800 rounded-lg">
            {legendItems.map((item: any) => (
                <LegendItem key={item.color} {...item} />
            ))}
        </div>
    );
}
  
  