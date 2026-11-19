// Minimal Buffer shim for react-native-svg's fetchData.ts
// Only the parts that file actually uses
class Buffer {
  static from(data, encoding) {
    if (typeof data === 'string') {
      return { toString: (enc) => data };
    }
    return { toString: (enc) => '' };
  }
}

module.exports = { Buffer };
