/* eslint-disable react-refresh/only-export-components */
import { Menu } from "@base-ui/react/menu"
import { cn } from "@/lib/utils";
import { forwardRef, isValidElement, type ComponentProps, type HTMLAttributes } from "react";

type TriggerProps = ComponentProps<typeof Menu.Trigger> & {
  asChild?: boolean;
};

const DropdownMenu = Menu.Root;
const DropdownMenuGroup = Menu.Group;
const DropdownMenuPortal = Menu.Portal;
const DropdownMenuSub = Menu.SubmenuRoot;
const DropdownMenuRadioGroup = Menu.RadioGroup;

const DropdownMenuTrigger = ({ asChild, children, ...props }: TriggerProps) => (
  <Menu.Trigger
    {...props}
    render={asChild && isValidElement(children) ? children : undefined}
  >
    {asChild ? undefined : children}
  </Menu.Trigger>
);

type ContentProps = Omit<ComponentProps<typeof Menu.Popup>, "ref"> & {
  side?: ComponentProps<typeof Menu.Positioner>["side"];
  align?: ComponentProps<typeof Menu.Positioner>["align"];
  sideOffset?: number;
  container?: ComponentProps<typeof Menu.Portal>["container"];
};

const DropdownMenuContent = forwardRef<HTMLDivElement, ContentProps>(
  (
    {
      className,
      side = "bottom",
      align = "center",
      sideOffset = 4,
      container,
      ...props
    },
    ref,
  ) => {
    const content = (
      <Menu.Positioner side={side} align={align} sideOffset={sideOffset}>
        <Menu.Popup
          ref={ref}
          className={cn(
            "z-[60] max-h-(--available-height) min-w-32 overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
            className,
          )}
          {...props}
        />
      </Menu.Positioner>
    );

    return <Menu.Portal container={container}>{content}</Menu.Portal>;
  },
);

const DropdownMenuItem = forwardRef<HTMLDivElement, ComponentProps<typeof Menu.Item>>(
  ({ className, ...props }, ref) => (
    <Menu.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    />
  ),
);

const DropdownMenuLabel = forwardRef<HTMLDivElement, ComponentProps<typeof Menu.GroupLabel>>(
  ({ className, ...props }, ref) => (
    <Menu.Group>
      <Menu.GroupLabel ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
    </Menu.Group>
  ),
);

const DropdownMenuSeparator = forwardRef<HTMLDivElement, ComponentProps<typeof Menu.Separator>>(
  ({ className, ...props }, ref) => (
    <Menu.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  ),
);

const DropdownMenuSubTrigger = Menu.SubmenuTrigger;
const DropdownMenuSubContent = Menu.Popup;
const DropdownMenuCheckboxItem = Menu.CheckboxItem;
const DropdownMenuRadioItem = Menu.RadioItem;

const DropdownMenuShortcut = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
