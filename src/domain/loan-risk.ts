export type AccountStatus = "delinquent" | "good-standing" | "closed";
export type OverallRisk = "low" | "medium" | "high" | "unable to determine";
export type RandomInteger = (min: number, max: number) => number;

export interface CustomerProfile {
  aliases: readonly string[];
  creditScore: number;
  accountStatus: AccountStatus;
}

export const CUSTOMER_PROFILES: readonly CustomerProfile[] = [
  {
    aliases: ["loren@ibm.com", "loren", "1111"],
    creditScore: 455,
    accountStatus: "good-standing",
  },
  {
    aliases: ["matt@ibm.com", "matt", "2222"],
    creditScore: 685,
    accountStatus: "closed",
  },
  {
    aliases: ["hilda@ibm.com", "hilda", "3333"],
    creditScore: 825,
    accountStatus: "delinquent",
  },
] as const;

const ACCOUNT_STATUSES: readonly AccountStatus[] = [
  "delinquent",
  "good-standing",
  "closed",
];

export const randomInteger: RandomInteger = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const profileFor = (customerId: string): CustomerProfile | undefined => {
  const normalizedId = customerId.trim().toLowerCase();
  return CUSTOMER_PROFILES.find((profile) =>
    profile.aliases.includes(normalizedId),
  );
};

export const getCreditScore = (
  customerId: string,
  getRandomInteger: RandomInteger = randomInteger,
): number =>
  profileFor(customerId)?.creditScore ?? getRandomInteger(300, 850);

export const getAccountStatus = (
  customerId: string,
  getRandomInteger: RandomInteger = randomInteger,
): AccountStatus =>
  profileFor(customerId)?.accountStatus ??
  ACCOUNT_STATUSES[getRandomInteger(0, ACCOUNT_STATUSES.length - 1)];

export const determineOverallRisk = (
  creditScore: number,
  accountStatus: string,
): OverallRisk => {
  const normalizedStatus = accountStatus.trim().toLowerCase();

  if (creditScore >= 750 && normalizedStatus === "good-standing") {
    return "low";
  }
  if (
    creditScore >= 750 &&
    (normalizedStatus === "closed" || normalizedStatus === "delinquent")
  ) {
    return "medium";
  }
  if (
    creditScore >= 550 &&
    creditScore < 750 &&
    normalizedStatus === "good-standing"
  ) {
    return "medium";
  }
  if (
    creditScore >= 550 &&
    creditScore < 750 &&
    (normalizedStatus === "closed" || normalizedStatus === "delinquent")
  ) {
    return "high";
  }
  if (creditScore < 550) {
    return "high";
  }
  return "unable to determine";
};

export const determineInterestRate = (overallRisk: string): number => {
  switch (overallRisk.trim().toLowerCase()) {
    case "low":
      return 3;
    case "medium":
      return 5;
    case "high":
      return 8;
    default:
      return 12;
  }
};
