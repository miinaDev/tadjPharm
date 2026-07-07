export interface VariantCombo {
  colorLabel?: string;
  sizeLabel?: string;
  volumeLabel?: string;
}

export function comboKey(combo: VariantCombo): string {
  return [combo.colorLabel ?? "", combo.sizeLabel ?? "", combo.volumeLabel ?? ""].join("|");
}

export function comboLabel(combo: VariantCombo): string {
  const parts = [combo.colorLabel, combo.sizeLabel, combo.volumeLabel].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Standard";
}

// Produit cartesien des valeurs d'options activees. Retourne [] tant qu'une option
// activee n'a pas encore de valeur (on ne peut pas encore definir de combinaison).
export function buildVariantCombos(
  hasColors: boolean,
  hasSizes: boolean,
  hasVolumes: boolean,
  colorLabels: string[],
  sizeLabels: string[],
  volumeLabels: string[]
): VariantCombo[] {
  if (!hasColors && !hasSizes && !hasVolumes) return [];

  const colorList: (string | undefined)[] = hasColors ? colorLabels : [undefined];
  const sizeList: (string | undefined)[] = hasSizes ? sizeLabels : [undefined];
  const volumeList: (string | undefined)[] = hasVolumes ? volumeLabels : [undefined];

  if (colorList.length === 0 || sizeList.length === 0 || volumeList.length === 0) return [];

  const combos: VariantCombo[] = [];
  for (const colorLabel of colorList) {
    for (const sizeLabel of sizeList) {
      for (const volumeLabel of volumeList) {
        combos.push({ colorLabel, sizeLabel, volumeLabel });
      }
    }
  }
  return combos;
}
