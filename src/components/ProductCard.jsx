const ProductCard = ({ volume, title, type, price, image }) => (
    <div className="group cursor-pointer">
      <div className="aspect-[3/4] overflow-hidden bg-accent-muted/20 rounded-lg mb-6">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100" 
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest font-bold text-primary">{volume}</span>
        <h4 className="text-lg font-bold">{title}</h4>
        <p className="text-sm text-text-main/50">{type}</p>
        <p className="mt-2 text-sm font-semibold">${price}</p>
      </div>
    </div>
  );
  
  export default ProductCard;