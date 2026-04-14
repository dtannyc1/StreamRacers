
const BuyMeACoffee = ({py = 2, px = 4}) => {
  return (
    <a href="https://www.buymeacoffee.com/pencils45" target="_blank" className="relative">
      <span className={`font-cookie text-center text-black text-xl bg-[#FFDD00] py-${py} px-${px} font-semibold rounded-md `}>
        💵 Support the project
      </span>
    </a>
  )
}

export default BuyMeACoffee;