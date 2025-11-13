import type { Member, Payment, Event } from "./types"

export const mockMembers: Member[] = [
  {
    id: "1",
    roadName: "Ironhorse",
    realName: "John Mitchell",
    phone: "555-0101",
    email: "ironhorse@mc.club",
    role: "admin",
    emergencyContact: "Jane Mitchell - 555-0102",
    joinDate: "2020-03-15",
  },
  {
    id: "2",
    roadName: "Viper",
    realName: "Marcus Stone",
    phone: "555-0103",
    email: "viper@mc.club",
    role: "member",
    emergencyContact: "Sarah Stone - 555-0104",
    joinDate: "2021-06-20",
  },
  {
    id: "3",
    roadName: "Thunder",
    realName: "David Cole",
    phone: "555-0105",
    email: "thunder@mc.club",
    role: "member",
    emergencyContact: "Lisa Cole - 555-0106",
    joinDate: "2021-09-10",
  },
  {
    id: "4",
    roadName: "Shadow",
    realName: "Mike Davis",
    phone: "555-0107",
    email: "shadow@mc.club",
    role: "prospect",
    emergencyContact: "Emily Davis - 555-0108",
    joinDate: "2024-01-15",
  },
  {
    id: "5",
    roadName: "Blaze",
    realName: "Alex Turner",
    phone: "555-0109",
    email: "blaze@mc.club",
    role: "prospect",
    emergencyContact: "Chris Turner - 555-0110",
    joinDate: "2024-03-01",
  },
  {
    id: "6",
    roadName: "Hawk",
    realName: "Tommy Reed",
    phone: "555-0111",
    email: "hawk@mc.club",
    role: "hangaround",
    joinDate: "2024-10-05",
  },
]

export const mockPayments: Payment[] = [
  {
    id: "1",
    memberId: "1",
    amount: 50,
    dueDate: "2024-11-01",
    paidDate: "2024-10-28",
    status: "paid",
  },
  {
    id: "2",
    memberId: "2",
    amount: 50,
    dueDate: "2024-11-01",
    paidDate: "2024-11-01",
    status: "paid",
  },
  {
    id: "3",
    memberId: "3",
    amount: 50,
    dueDate: "2024-11-01",
    status: "pending",
  },
  {
    id: "4",
    memberId: "4",
    amount: 30,
    dueDate: "2024-10-15",
    status: "overdue",
  },
]

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Monthly Club Meeting",
    date: "2024-11-20",
    time: "19:00",
    location: "Clubhouse",
    description: "Regular monthly meeting to discuss club business",
    type: "member",
    rsvpList: ["1", "2", "3"],
  },
  {
    id: "2",
    title: "Charity Ride",
    date: "2024-11-25",
    time: "10:00",
    location: "Main Street Parking",
    description: "Public charity ride for local veterans",
    type: "public",
    rsvpList: ["1", "2", "3", "4", "5", "6"],
  },
  {
    id: "3",
    title: "Private Run",
    date: "2024-12-05",
    time: "14:00",
    location: "TBA",
    description: "Members only weekend ride",
    type: "private",
    rsvpList: ["1", "2"],
  },
]

export const mockRules = {
  bylaws: {
    title: "Club Bylaws",
    content: `**Article I: Name and Purpose**

The name of this organization shall be Steel Riders Motorcycle Club (MC). The purpose of this club is to promote brotherhood, safe motorcycle riding, community service, and the preservation of motorcycle culture.

**Article II: Membership**

Membership is open to individuals who share our values and ride motorcycles. All prospective members must go through the proper prospecting period as determined by the club.

**Article III: Meetings**

Regular meetings shall be held monthly. Special meetings may be called by the President or upon request of a majority of members. A quorum shall consist of 60% of active members.`,
  },
  requirements: {
    title: "Membership Requirements",
    content: `**Guest Status**
- Attend public events
- Learn about the club culture
- No voting rights

**Hangaround Status**
- Invited by existing member
- Attend club events
- Begin learning club ways
- Duration: Minimum 3 months

**Prospect Status**
- Voted in by full members
- Attend all meetings and events
- Complete assigned tasks
- Learn club rules and history
- Wear prospect patch
- Duration: Minimum 6 months

**Full Membership**
- Unanimous vote required
- Own and maintain motorcycle
- Pay monthly dues
- Earn full colors
- Full voting rights`,
  },
  conduct: {
    title: "Code of Conduct",
    content: `**Respect and Brotherhood**
All members must treat each other with respect and maintain brotherhood at all times. Personal conflicts must be resolved through proper channels.

**Safety First**
Safe riding practices are mandatory. Members under the influence will not ride and will lose their patch.

**Loyalty**
Members must be loyal to the club and fellow members. Discussing internal club matters outside the club is strictly prohibited.

**Representation**
Members represent the club at all times when wearing colors. Conduct must reflect positively on the organization.

**Integrity**
Members must be honest and forthright in all dealings with the club and fellow members.`,
  },
  patch: {
    title: "Patch Protocol",
    content: `**Wearing Your Colors**
- Colors must be kept clean and in good condition
- Never let anyone else wear your colors
- Remove colors before entering another club's territory without permission
- Colors are never to be worn during illegal activities

**Respect for Colors**
- Stand when colors enter the room during meetings
- Never throw or disrespect any member's colors
- Lost or stolen colors must be reported immediately

**Earning Your Patch**
- Prospect patch is earned after hangaround period
- Full patch requires unanimous vote
- Center patch represents full membership
- Rockers indicate chapter and territory`,
  },
  meetings: {
    title: "Meeting Procedures",
    content: `**Meeting Structure**
1. Call to order by President
2. Roll call
3. Reading and approval of previous minutes
4. Officer reports
5. Old business
6. New business
7. Good of the club
8. Adjournment

**Meeting Etiquette**
- Arrive on time
- Cell phones on silent
- Speak when recognized by President
- One member speaks at a time
- Respect all opinions
- What's said in church stays in church`,
  },
  voting: {
    title: "Voting Rules",
    content: `**Voting Eligibility**
Only full members in good standing may vote. Members behind on dues forfeit voting rights until current.

**Vote Requirements**
- Simple Majority (51%): General club business
- Two-thirds Majority (67%): Officer elections, expenditures over $500
- Unanimous (100%): New member acceptance, member expulsion

**Voting Process**
- Motion must be made and seconded
- Discussion period
- Vote called by President
- Results recorded in minutes
- President breaks ties except for unanimous votes

**Proxy Voting**
Not permitted. Members must be present to vote.`,
  },
}
