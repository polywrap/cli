import { SHA3_Query } from "./mutation/w3/imported/SHA3_Query";
import { UTS46_Query } from "./mutation/w3/imported/UTS46_Query";

export function namehash(inputName: string): string {
  let node = "";
  for (let i: number = 0; i < 32; i++) {
    node += "00";
  }

  const name: string = normalize(inputName)

  if (name) {
    const labels: string[] = name.split('.');

    for(let i = labels.length - 1; i >= 0; i--) {
      let labelSha = SHA3_Query.keccak_256({ message: labels[i] })
      node = SHA3_Query.hex_keccak_256({ message: node + labelSha })
    }
  }

  return "0x" + node;
}

export function normalize(name: string): string {
  return name ? UTS46_Query.toAscii({ 
    value: name
  }) : name
}

export function keccak256 (value: string): string {
  return "0x" + SHA3_Query.keccak_256({ message: value })
}
