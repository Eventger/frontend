type AuthLogoMarkProps = {
  inverse?: boolean
  size?: 'small' | 'large'
}

export function AuthLogoMark({
  inverse = false,
  size = 'large',
}: AuthLogoMarkProps) {
  const isSmall = size === 'small'
  const fill = inverse
    ? 'bg-[#4f46e5]'
    : 'bg-white'
  const border = inverse
    ? 'border-[#4f46e5]'
    : 'border-white'

  return (
    <span
      className={`relative block shrink-0 overflow-hidden ${
        isSmall
          ? 'size-11 rounded-lg'
          : 'size-12 rounded-xl'
      } ${inverse ? 'bg-white' : 'bg-[#4f46e5]'}`}
      aria-hidden="true"
    >
      <span
        className={`absolute rounded-sm ${fill} ${
          isSmall
            ? 'left-[12px] top-[5px] h-[10px] w-[5px]'
            : 'left-[13px] top-[5px] h-[11px] w-[5px]'
        }`}
      />
      <span
        className={`absolute rounded-sm ${fill} ${
          isSmall
            ? 'left-[28px] top-[5px] h-[10px] w-[5px]'
            : 'left-[30px] top-[5px] h-[11px] w-[5px]'
        }`}
      />
      <span
        className={`absolute bg-transparent ${border} ${
          isSmall
            ? 'left-[8px] top-[11px] h-[26px] w-[28px] rounded-[6px] border'
            : 'left-[9px] top-3 h-7 w-[30px] rounded-md border'
        }`}
      />
      <span
        className={`absolute rounded-sm ${fill} ${
          isSmall
            ? 'left-[14px] top-[19px] h-1 w-[17px]'
            : 'left-[15px] top-[21px] h-1 w-[18px]'
        }`}
      />
      <span
        className={`absolute rounded-sm ${fill} ${
          isSmall
            ? 'left-[14px] top-[27px] h-1 w-[11px]'
            : 'left-[15px] top-[29px] h-1 w-3'
        }`}
      />
    </span>
  )
}
