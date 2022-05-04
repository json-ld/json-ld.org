/**
 * abstract class for structure errors in e.g. FHIR StructureDefinitions or ShExJ
 */

class StructureError extends Error {
  /**
   * dump additional debugging information
    * @param log a stream like `console.log`
   */
  logMessage (log) {
    log(`Unknown StructureError`, this);
  }
}

if (typeof module !== 'undefined')
  module.exports = {StructureError};
