function LegendItem({ color, text, emoji }: { color: string; text: string; emoji: string }) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true">{emoji}</span>
      <p className={`text-${color}`}>{text}</p>
    </div>
  );
}

export default function Legend({ legendItems }: { legendItems: any[] }) {
  return (
    <div className="my-8 flex flex-col items-center justify-center gap-4 rounded-lg bg-gray-800 p-4 md:flex-row md:gap-6">
      {legendItems.map((item: any) => (
        <LegendItem key={item.color} {...item} />
      ))}
    </div>
  );
}
