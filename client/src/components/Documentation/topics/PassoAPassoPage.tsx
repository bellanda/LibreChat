import { platform_step_by_step } from "../utils";

export default function PassoAPassoPage() {
  return (
    <div className="mx-auto space-y-8">
      <main className="space-y-12">
        {platform_step_by_step.map(({ number, icon, title, description, img, tip, link }) => (
          <div key={number} className="space-y-2">
            <h2 className="text-xl font-semibold">
              {icon} Passo {number}: {title}
            </h2>
            <p className="text-gray-200">{description} {link && <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">{link}</a>}</p>
            {img && <img src={img} alt={title} className="w-full h-auto rounded" />}
            <p className="text-gray-400 italic">{tip}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
