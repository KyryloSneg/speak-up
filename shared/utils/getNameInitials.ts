function getNameInitials(name: string): string {
  let initials;

  const nameSplit = name.split(" ");
  const nameLength = nameSplit.length;

  if (nameLength > 1) {
    // first initial + last initial
    initials = nameSplit[0][0] + nameSplit[nameLength - 1][0];
  } else if (nameLength === 1) {
    initials = nameSplit[0][0];
  } else return "";

  return initials.toUpperCase();
}

export default getNameInitials;
