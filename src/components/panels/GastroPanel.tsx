import React from "react";
import { GastroLabels, ProductTypes } from "../../const";
import { Entry, Place, Product } from "../../types";
import { formatPrice, formatVolume } from "../../utils";
import { CloseButton } from "../Buttons";
import { formatPhone, formatPlaceType, formatWebsite, googlifyAddress } from "./format";

// Sort entries per location by productType to get groups
function sortEntriesByProductType(
  entries: Entry[],
  products: Map<number, Product>,
  typeOrder: string[],
) {
  const typePriority = new Map<string, number>(typeOrder.map((type, i) => [type, i]));

  return [...entries].sort((a, b) => {
    const productA = products.get(a.productId);
    const productB = products.get(b.productId);
    if (!productA || !productB) return 0;

    const idxA = typePriority.get(productA.productType) ?? Infinity;
    const idxB = typePriority.get(productB.productType) ?? Infinity;

    return idxA - idxB;
  });
}

// Get entries belonging to Weinschorle, Spritz or non-alcoholic Spritz
function isCategoryFurtherDrinks(product: Product): boolean {
  const nameLower = product.productName.toLowerCase();
  return GastroLabels.FurtherCategories.some((token) => nameLower.includes(token.toLowerCase()));
}

// Render product name, style non-alcoholic string
function renderProductName(name: string): React.ReactNode[] {
  return name.split(GastroLabels.NonAlcoholic).flatMap((part, i, arr) => [
    part,
    ...(i < arr.length - 1
      ? [
          <span key={`alko-${i}`} className="info_small_panel_text">
            {GastroLabels.NonAlcoholic}
          </span>,
        ]
      : []),
  ]);
}

function renderBrandRow(brand: string, index: number) {
  return (
    <div key={`brand-${index}`} className="info_brand-row">
      <div className="info_brand">{brand}</div>
    </div>
  );
}

function renderProductRow(entry: Entry, product: Product, groupKey: string, i: number) {
  const isFurther = groupKey === GastroLabels.FurtherDrinks;

  return (
    <div key={`entry-${groupKey}-${i}`} className="info_menu-row info_product-row indent">
      <div className="info_product">{renderProductName(product.productName)}</div>
      <div className="info_volume">{formatVolume(entry.volume)}</div>
      <div className="info_price">
        {isFurther && <span className="info_small_panel_text">ab</span>}
        <span className="price-value">{formatPrice(entry.price)}</span>
      </div>
    </div>
  );
}

/* Format main table for the drink entries in the gastro panel */
function formatEntries(activeEntries: Entry[] | undefined, products: Map<number, Product>) {
  if (!activeEntries || activeEntries.length === 0) {
    return <p className="info_product">{GastroLabels.NoPrices} 😕</p>;
  }

  // Sort entries once by product type
  const sortedEntries = sortEntriesByProductType(activeEntries, products, [...ProductTypes]);

  // Group entries by brand or as "further"
  const groupedEntries = new Map<string, Entry[]>();
  const furtherEntries: Entry[] = [];

  for (const entry of sortedEntries) {
    const product = products.get(entry.productId);
    if (!product) continue;

    if (isCategoryFurtherDrinks(product)) {
      furtherEntries.push(entry);
    } else {
      const brandKey = product.brandName || product.productName || "Unbekannt";
      if (!groupedEntries.has(brandKey)) groupedEntries.set(brandKey, []);
      groupedEntries.get(brandKey)!.push(entry);
    }
  }

  if (furtherEntries.length) groupedEntries.set(GastroLabels.FurtherDrinks, furtherEntries);

  return (
    <div className="info_menu">
      {Array.from(groupedEntries.entries()).flatMap(([brand, entries], groupIndex) => [
        renderBrandRow(brand, groupIndex),
        ...entries.map((entry, i) => {
          const product = products.get(entry.productId)!;
          return renderProductRow(entry, product, brand, i);
        }),
      ])}
    </div>
  );
}

export default function GastroPanel({
  activePlace,
  activeEntries,
  products,
  unsetActivePlace,
}: {
  activePlace: Place;
  activeEntries: Entry[] | undefined;
  products: Map<number, Product>;
  unsetActivePlace: () => void;
}) {
  return (
    <div className="info-panel">
      <CloseButton onClick={unsetActivePlace} />
      <h3>{activePlace.placeName}</h3>
      {formatPlaceType(activePlace.placeType)}
      <div className="info-divider" />
      {googlifyAddress(activePlace.address)}
      {formatPhone(activePlace.phone)}
      {formatWebsite(activePlace.website)}
      {formatEntries(activeEntries, products)}
    </div>
  );
}
