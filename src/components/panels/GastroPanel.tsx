import { GastroLabels, ProductTypes } from "../../const";
import { Entry, Place, Product } from "../../types";
import { CloseButton } from "../Buttons";
import {
  formatPhone,
  formatPlaceType,
  formatPrice,
  formatProductName,
  formatVolume,
  formatWebsite,
  googlifyAddress,
} from "./format";

// Sort entries per location by productType to get groups
function sortEntriesByProductType(entries: Entry[], products: Map<number, Product>) {
  const typePriority = new Map<string, number>(ProductTypes.map((type, i) => [type, i]));

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

function BrandRow({ brand }: { brand: string }) {
  return <div className="prices-brand">{brand}</div>;
}

function ProductRow({
  entry,
  product,
  groupKey,
}: {
  entry: Entry;
  product: Product;
  groupKey: string;
}) {
  const isFurther = groupKey === GastroLabels.FurtherDrinks;

  return (
    <>
      {formatProductName(product.productName)}
      {formatVolume(entry.volume)}
      {formatPrice(entry.price, isFurther)}
    </>
  );
}

/* Format main table for the drink entries in the gastro panel */
function formatEntries(activeEntries: Entry[] | undefined, products: Map<number, Product>) {
  if (!activeEntries || activeEntries.length === 0) {
    return <p className="info_product">{GastroLabels.NoPrices} 😕</p>;
  }

  // Sort entries once by product type
  const sortedEntries = sortEntriesByProductType(activeEntries, products);

  // Group entries by brand or as "further"
  const groupedEntries = new Map<string, Entry[]>();
  const furtherEntries: Entry[] = [];

  for (const entry of sortedEntries) {
    const product = products.get(entry.productId)!;

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
    <div className="prices-table">
      {Array.from(groupedEntries.entries()).flatMap(([brand, entries]) => [
        <BrandRow key={brand} brand={brand} />,
        ...entries.map((entry, i) => {
          const product = products.get(entry.productId)!;
          return (
            <ProductRow key={`${brand}-${i}`} entry={entry} product={product} groupKey={brand} />
          );
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
