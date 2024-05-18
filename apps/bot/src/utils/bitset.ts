export type Bitset32Mask =
  | 0b1
  | 0b10
  | 0b100
  | 0b1000
  | 0b10000
  | 0b100000
  | 0b1000000
  | 0b10000000
  | 0b100000000
  | 0b1000000000
  | 0b10000000000
  | 0b100000000000
  | 0b1000000000000
  | 0b10000000000000
  | 0b100000000000000
  | 0b1000000000000000
  | 0b10000000000000000
  | 0b100000000000000000
  | 0b1000000000000000000
  | 0b10000000000000000000
  | 0b100000000000000000000
  | 0b1000000000000000000000
  | 0b10000000000000000000000
  | 0b100000000000000000000000
  | 0b1000000000000000000000000
  | 0b10000000000000000000000000
  | 0b100000000000000000000000000
  | 0b1000000000000000000000000000
  | 0b10000000000000000000000000000
  | 0b100000000000000000000000000000
  | 0b1000000000000000000000000000000
  | 0b10000000000000000000000000000000;

export const bitset = <Mask extends number = Bitset32Mask>(bitset: number) => ({
  /**
   * Set a bit in a bitset
   * @param mask The mask of the bit to set
   * @returns The new bitset
   */
  set(mask: Mask) {
    return bitset | mask;
  },
  /**
   * Unset a bit in a bitset
   * @param mask The mask of the bit to unset
   * @returns The new bitset
   */
  unset(mask: Mask) {
    return bitset & ~mask;
  },
  /**
   * Toggle a bit in a bitset
   * @param mask The mask of the bit to toggle
   * @returns The new bitset
   */
  toggle(mask: Mask) {
    return bitset ^ mask;
  },
  /**
   * Get the value of a bit in a bitset
   * @param mask The mask of the bit to check
   * @returns A boolean indicating if the bit is set
   */
  get(mask: Mask) {
    return (bitset & mask) === mask;
  },
  /**
   * Check if a bit is enabled in a bitset
   * @description This is the same as `get` and is provided for better readability.
   * @param mask The mask of the bit to check
   * @returns A boolean indicating if the bit is set
   */
  isSet(mask: Mask) {
    return this.get(mask);
  },
  /**
   * Check if a bit is not set in a bitset
   * @description This is the opposite of `get`, `enabled` and is provided for better readability.
   * @param mask The mask of the bit to check
   * @returns A boolean indicating if the bit is not set
   */
  isNotSet(mask: Mask) {
    return !this.get(mask);
  },
});
