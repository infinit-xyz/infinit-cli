export class Validation {
  public validate: (val?: string) => boolean
  public onValidationErrorText: string

  constructor(validate: (val?: string) => boolean, onValidationErrorText: string) {
    this.validate = validate
    this.onValidationErrorText = onValidationErrorText
  }
}
