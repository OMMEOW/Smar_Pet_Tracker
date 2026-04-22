"use client";

import Link from "next/link";

interface Pet {
  petId: string;
  name: string;
  species?: string;
  breed?: string;
  imageUrl?: string;
  alert?: boolean;
}

interface PetCardProps {
  data: Pet;
}

export function PetCard({ data: pet }: PetCardProps) {
  return (
    <Link 
      href={`/pets/${pet.petId}`}
      className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 h-full flex flex-col"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-surface-container-high">
        <img 
          src={pet.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBkEFufOIxlqQakA4gWGx1HVzJJCp3UsFCnbBKzTxp3Fw2-JDJt37LVpDM0gltMYKBfl_E4TvWgYpBol9CDkYM4R9AWBq0acw7qHknL5YbV56kaZ0iDYWP4USuO0iBFIgZBanZdeJBW8UWveeP2EddizjtCbL_Hlk-dNzsV2NU5GyG9DkrE18ULaW_l26LDwv6EBFwYzJXqIOJIcsnGW-ooEXd7EYFReDAgUU_Lc8obm6KjxBharFsWCd_eFIywWo4Z2H9Dp5ZOt0A"} 
          alt={pet.name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-on-surface tracking-wider uppercase">
            {pet.alert ? "⚠️ Alert" : "✅ Safe"}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold font-headline mb-1 capitalize group-hover:text-primary transition-colors">{pet.name}</h3>
        <p className="text-xs text-secondary font-label uppercase tracking-widest mb-4">{pet.breed || pet.species}</p>
        <div className="flex items-center justify-between pt-4 border-t border-surface-container-high mt-auto">
          <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">battery_full</span>
              <span className="text-xs font-bold font-headline">84%</span>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_forward</span>
        </div>
      </div>
    </Link>
  );
}
