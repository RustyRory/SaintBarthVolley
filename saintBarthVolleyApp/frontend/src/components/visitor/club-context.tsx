"use client";

import { createContext, useContext } from "react";

export type ClubValue = {
  _id?: string;
  emoji: string;
  title: string;
  description: string;
};

export type ClubSocialLinks = {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  sporteasy?: string;
  clubMerch?: string;
  clubRegistration?: string;
  website?: string;
  other?: string;
};

export type Club = {
  _id: string;
  name: string;
  subtitle: string;
  homeDescription: string;
  clubDescription: string;
  ownerDescription: string;
  logo: string;
  photo: string;
  aboutPhoto: string;
  email: string;
  phone: string;
  address: string;
  values: ClubValue[];
  social_links: ClubSocialLinks;
};

const ClubContext = createContext<Club | null>(null);

export function ClubProvider({
  club,
  children,
}: {
  club: Club | null;
  children: React.ReactNode;
}) {
  return <ClubContext.Provider value={club}>{children}</ClubContext.Provider>;
}

export function useClub() {
  return useContext(ClubContext);
}
