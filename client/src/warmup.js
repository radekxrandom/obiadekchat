const enumRating = {
  outstanding: "Outstanding",
  above_avg: "Above average",
  avg: "Average",
  below_avg: "Below average",
  poor: "Poor",
  dunno: "No opinion"
};

const presidents = [
  "George W. Bush",
  "Barack Obama	",
  "Bill Clinton	",
  "George H. W. Bush",
  "Ronald Reagan	",
  "John F. Kennedy",
  "Richard Nixon",
  "Jimmy Carter",
  "Gerald Ford",
  "Lyndon B. Johnson",
  "Dwight D. Eisenhower"
];

class PresidentRater {
  constructor(presidents) {
    this.presidents = presidents;
    this.enumRating = {
      outstanding: "Outstanding",
      above_avg: "Above average",
      avg: "Average",
      below_avg: "Below average",
      poor: "Poor",
      dunno: "No opinion",
      wrong: "You stupid or what?"
    };
  }

  ratePresident(president) {
    const answer = prompt(`What is your rating of ${president}`);
    if (parseInt(answer) > 6 || parseInt(answer) < 1) {
      const rated = {
        president,
        rating: this.enumRating.wrong
      };
      return rated;
    }
  }
}
