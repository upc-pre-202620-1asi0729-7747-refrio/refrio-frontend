/**
 * ErrorHandlingEnabledBaseType — mixin for error state management.
 * Provides a reactive error property with helper methods.
 */
export class ErrorHandlingEnabledBaseType {
  error: string | null = null;
  isLoading: boolean = false;

  protected setError(message: string): void {
    this.error = message;
    this.isLoading = false;
  }

  protected clearError(): void {
    this.error = null;
  }

  protected startLoading(): void {
    this.isLoading = true;
    this.error = null;
  }

  protected stopLoading(): void {
    this.isLoading = false;
  }
}
