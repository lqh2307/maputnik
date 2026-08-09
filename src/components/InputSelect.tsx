import React from "react";

export type InputSelectProps = {
  value: string;
  "data-wd-key"?: string;
  options: [string, any][] | string[];
  style?: object;
  onChange(value: string | [string, any]): unknown;
  title?: string;
  "aria-label"?: string;
};

export class InputSelect extends React.Component<InputSelectProps> {
  render() {
    const options: [string, any][] =
      this.props.options.length > 0 && !Array.isArray(this.props.options[0])
        ? (this.props.options.map((v) => [v, v]) as [string, any][])
        : (this.props.options as [string, any][]);

    return (
      <select
        className="maputnik-select"
        data-wd-key={this.props["data-wd-key"]}
        style={this.props.style}
        title={this.props.title}
        value={this.props.value}
        onChange={(e) => this.props.onChange(e.target.value)}
        aria-label={this.props["aria-label"]}
      >
        {options.map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
    );
  }
}
