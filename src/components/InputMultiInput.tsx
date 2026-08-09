import React from "react";
import classnames from "classnames";

export type InputMultiInputProps = {
  name?: string;
  value: string;
  options: any[];
  onChange(...args: unknown[]): unknown;
  "aria-label"?: string;
};

export class InputMultiInput extends React.Component<InputMultiInputProps> {
  render() {
    const options: [string, any][] =
      this.props.options.length > 0 && !Array.isArray(this.props.options[0])
        ? this.props.options.map((v) => [v, v])
        : (this.props.options as [string, any][]);

    const selectedValue = this.props.value || options[0][0];
    const radios = options.map(([val, label]) => {
      return (
        <label
          key={val}
          className={classnames("maputnik-button", "maputnik-radio-as-button", {
            "maputnik-button-selected": val === selectedValue,
          })}
        >
          <input
            type="radio"
            name={this.props.name}
            onChange={(_e) => this.props.onChange(val)}
            value={val}
            checked={val === selectedValue}
          />
          {label}
        </label>
      );
    });

    return (
      <fieldset
        className="maputnik-multibutton"
        aria-label={this.props["aria-label"]}
      >
        {radios}
      </fieldset>
    );
  }
}
