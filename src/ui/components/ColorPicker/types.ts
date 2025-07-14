type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;
type ClassDictionary = Record<string, any>;
type ClassArray = ClassValue[];
function clsx(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

export type hsl = {
  h: number;
  s: number;
  l: number;
};

export type hex = {
  hex: string;
};
export type Color = hsl & hex;



