
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const AvatarContainer = motion.div

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    online?: boolean
    showBorder?: boolean
    showAnimation?: boolean
    pulseAnimation?: boolean
  }
>(({ className, online, showBorder = false, showAnimation = false, pulseAnimation = false, ...props }, ref) => (
  <AvatarContainer 
    className="relative inline-block"
    animate={showAnimation ? {
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0]
    } : undefined}
    transition={{
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 3
    }}
  >
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full transition-all duration-300",
        showBorder && "ring-2 ring-primary ring-offset-2 ring-offset-background hover:ring-primary/80",
        "hover:scale-105",
        className
      )}
      {...props}
    />
    {online !== undefined && (
      <motion.span 
        className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
          online ? "bg-green-500" : "bg-gray-400"
        )}
        initial={{ scale: 0 }}
        animate={pulseAnimation && online ? {
          scale: [1, 1.2],
          opacity: [1, 0.8]
        } : { scale: 1 }}
        transition={pulseAnimation ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : undefined}
      />
    )}
  </AvatarContainer>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      "aspect-square h-full w-full object-cover",
      "transition-opacity duration-300",
      className
    )}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      "animate-in fade-in duration-200",
      className
    )}
    {...props}
  >
    <UserCircle className="h-6 w-6 text-muted-foreground" />
  </AvatarPrimitive.Fallback>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
