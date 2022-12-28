/**
 * Internal service method to generate unique id
 * @param {*} prefix takes predefined prefix for creating ids
 * @param {*} length size of id to be generated
 * @returns a unique id of given length and a prefix 
 */
const generateObjectId = (prefix, length = 8) => {
  let id = prefix || '';
  // Always start the id with a char
  id += (Math.floor(Math.random() * 25) + 10).toString(36);
  // Add a timestamp in milliseconds (base 36) for uniqueness
  id += new Date().getTime().toString(36);
  // Similar to above, complete the Id using random, alphanumeric characters
  do {
    id += Math.floor(Math.random() * 35).toString(36);
  } while (id.length < length);
  return id;
};

module.exports = {
  generateObjectId
}