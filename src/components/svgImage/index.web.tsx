import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import Image from '../image';
import {isSvg, isSvgUri, isBase64ImageContent} from '../../utils/imageUtils';

const PostCssPackage = require('../../optionalDependencies').PostCssPackage;

const DEFAULT_SIZE = 16;
export interface SvgImageProps {
  /**
   * the asset tint
   */
  tintColor?: string | null;
  data: any; // TODO: I thought this should be string | React.ReactNode but it doesn't work properly
  style?: object[];
  height?: number;
  width?: number;
  id?: string;
}

function SvgImage(props: SvgImageProps) {
  const {data, style = [], tintColor, width, height, ...others} = props;
  const [className] = useState(`svg-${new Date().getTime().toString()}`);
  const [svgStyleCss, setSvgStyleCss] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (PostCssPackage) {
      const {postcss, cssjs} = PostCssPackage;
      const styleObj: Record<string, any> = StyleSheet.flatten(style);
      postcss()
        .process({width, height, ...styleObj}, {parser: cssjs})
        .then((style: {css: any}) => {
          const svgPathCss = styleObj?.tintColor ? `.${className} > svg path {fill: ${styleObj?.tintColor}}` : '';
          setSvgStyleCss(`.${className} > svg {${style.css}} ${svgPathCss}}`);
        });
    }
  }, [style, className, width, height]);

  if (isSvgUri(data)) {
    return <img {...others} src={data.uri} style={StyleSheet.flatten(style)}/>;
  } else if (isBase64ImageContent(data)) {
    if (tintColor) {
      return (
        <Image
          source={{uri: data}}
          width={DEFAULT_SIZE}
          height={DEFAULT_SIZE}
          style={[style, {tintColor}]}
          {...others}
        />
      );
    }
    return <img {...others} src={data} style={StyleSheet.flatten(style)}/>;
  } else if (data && svgStyleCss) {
    const svgStyleTag = `<style> ${svgStyleCss} </style>`;
    return (
      <div 
        {...others}
        className={className}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{__html: svgStyleTag + data}}
      />
    );
  }
  return null;
}

SvgImage.displayName = 'IGNORE';
SvgImage.isSvg = isSvg;

export default SvgImage;
