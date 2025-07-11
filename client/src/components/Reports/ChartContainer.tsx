import { FC } from "react";
import { ChartContainerProps } from "./interfaces";

const ChartContainer: FC<ChartContainerProps> = ({ title, children }) => (
    <div className="bg-[#1c1c1c] p-5 rounded-xl border border-gray-700/50">
      <h3 className="text-white font-bold text-lg mb-4">{title}</h3>
      <div className="h-[300px] w-full">{children}</div>
    </div>
);

export default ChartContainer;