import { cn } from "@/libraries/utilities";
import { VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, FC } from "react";


// jelikoz button budeme pouzivat na vice strankach a vsude bude vypadat jinde, tady si muzeme nastavit varianty tech tlacitek - takze na kazdou variantu jine classes. Jsou to vsechno basic CSS classes
// abychom toto mohli udelat musime pouzit class-variance-authority
export const buttonVariants = cva(
    // toto jsou classes pro vsechny buttons a k tomu budeme pridavat extra classes pomoci tech variants
    'active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-color focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:focus:ring-offset-slate-900 dark:focus:ring-slate-400',
    {
        // tady uz mame napsany possible varianty: 'variants' je povinne a musi byt takto napsane, stejne jako 'defaultVariants', ostatni nazvy jsou volitelne
        variants: {
            variant: {
                default: 'bg-slate-900 text-white hover:bg-slate-800 dark:hover:bg-red-300 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-100',
                ghost: 'bg-transparent hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 dark:text-slate-400'
            },
            size: {
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-2',
                lg: 'h11 px-8'
            }
        },
        //tady musis specifikovat ktere chces mit jako default - tzn kdyz zadnou variantu a size nezvolis
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
)

// tady uz pracujeme s Typescript a nastavime to tak ,abychom ty varianty co jsme si nahore zvolili byli schopni pouzit.
// extends ButtonHTMLAttributes<HTMLButtonElement> znamena, ze budeme moct pouzit klasicke React veci na nasi Button komponentu, tzn onChange,onClick etc. 
//VariantProps<typeof buttonVariants>, patri k 'cva', timto vlastne spojime ty buttonVariants ktere jsme si vypsali tady nahore a umozni nam pouzivat tam kde si tuto <Button/> komponentu zavolame, ty rozdilne classes co tu mame vypsane, jako size: default/sm/lg nebo variants:default/ghost
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    // toto uz je TSX schema pro nas button. otaznik znamena optional
    isLoading?: boolean
}

// musis tady vypsat do zavorek vsechno co mame napsany na teto strance nahore + children a className. ...props znamena aby to mohlo prijmout i jakekoliv jine props nez ty co tu mame deconstructly.
const Button: FC<ButtonProps> = ({ size, variant, className, children, isLoading, ...props }) => {

    return <>
        {/* cn je nase utility function vypsana v utilities, pomoci teto function muzeme overridnout className co tady mame vypsane, napr kdyz mame vsechny tlacitka modry a najednou bych chtela treba jedno cerveny, tak na to muzu hodit normalne class a bude to fungovat
    takze rikas cn - budeme pouzivat buttonVariants kde deconstructneme to co ta mame, tedy variant a size a + jakekoli classeNames. A tailwing merge nam to spoji vsechno dohromady */}
        <button className={cn(buttonVariants({ variant, size, className }))} disabled={isLoading} {...props}>
            {/* Loader2 je od lucide-react ikonka  */}
            {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
            {children}
        </button>
    </>


}


export default Button
