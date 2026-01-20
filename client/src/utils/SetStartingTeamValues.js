export const SetStartingTeamValues = (clubData) => {
  const number = clubData.squadNumber;

  console.log(number);

  if (number === 7) {
    return {
      def: 1,
      mid: 2,
      fwd: 1,
    };
  }
  if (number === 9) {
    return {
      def: 2,
      mid: 3,
      fwd: 1,
    };
  }
  if (number === 12) {
    return {
      def: 3,
      mid: 3,
      fwd: 2,
    };
  }
  if (number === 15) {
    return {
      def: 4,
      mid: 4,
      fwd: 2,
    };
  }
  // fallback opt
  return { def: 0, mid: 0, fwd: 0 };
};
