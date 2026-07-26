type TokenValue = number | string;

export type TokenVariantStyle<
  Property extends string,
  Value extends TokenValue,
> = Partial<Record<Property, Value>>;

export const createTokenVariants = <
  Key extends string,
  Value extends TokenValue,
  Property extends string,
>(
  tokens: Readonly<Record<Key, Value>>,
  property: Property,
): Record<Key, TokenVariantStyle<Property, Value>> => {
  const variants = {} as Record<Key, TokenVariantStyle<Property, Value>>;

  (Object.keys(tokens) as Key[]).forEach(key => {
    variants[key] = { [property]: tokens[key] } as TokenVariantStyle<
      Property,
      Value
    >;
  });

  return variants;
};
