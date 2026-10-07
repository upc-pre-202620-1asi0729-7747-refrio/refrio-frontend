/**
 * BaseAssembler — generic assembler that converts between
 * domain entities (TDomain) and API response DTOs (TResponse).
 *
 * Every bounded context assembler should extend this class
 * and implement the two abstract methods.
 */
export abstract class BaseAssembler<TDomain, TResponse> {
  /**
   * Convert an API response DTO into a domain entity.
   */
  abstract toEntityFromResponse(response: TResponse): TDomain;

  /**
   * Convert an array of API response DTOs into domain entities.
   */
  toEntitiesFromResponse(responses: TResponse[]): TDomain[] {
    return responses.map((r) => this.toEntityFromResponse(r));
  }
}
