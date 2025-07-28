import { steps } from "../utils";

export default function PassoAPassoPage() {
  return (
    <div className="mx-auto space-y-8">
      <main className="space-y-12">
        {steps.map(({ number, icon, title, description, img, tip }) => (
          <div key={number} className="space-y-2">
            <h2 className="text-xl font-semibold">
              {icon} Passo {number}: {title}
            </h2>
            <p className="text-gray-200">{description}</p>
            {img && <img src={img} alt={title} className="w-full h-auto rounded" />}
            <p className="text-gray-400 italic">{tip}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
