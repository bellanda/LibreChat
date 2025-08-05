// import Step from './Step'; // Componente para cada passo
// import Legend from './Legend'; // Componente para a legenda
// import CodeBlock from './CodeBlock'; // Componente para blocos de código

import { pastas_step_by_step } from '../../utils';



function Step({ title, description, image, children }) {
  return (
    <section className="space-y-4 border-t border-gray-700 pt-6">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      
      {description && <p className="text-gray-300">{description}</p>}
      
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-auto rounded-lg border border-gray-600"
        />
      )}

      {/* Renderiza qualquer conteúdo extra passado para o passo */}
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function PastasPage() {
  return (
    <main className="mx-auto space-y-12 ">
      {/* --- Capítulo --- */}
      <section>
        <h1 className="text-3xl font-bold mb-2">
          Como criar pastas?
        </h1>
        <p className="text-gray-300 leading-relaxed">
          As pastas são uma forma de organizar seus chats e informações, você pode criar pastas para diferentes projetos, clientes, etc.
        </p>
      </section>


      {/* --- Passos --- */}
      <div className="space-y-10">
        {pastas_step_by_step.map((step, index) => (
          <Step
            key={index}
            title={step.title}
            description={step.description}
            image={step.image}
          >
            {step.children}
          </Step>
        ))}
      </div>
    </main>
  );
}