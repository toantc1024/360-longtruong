import { Separator } from "@/components/ui/separator";
import { Logo } from "../navbar/logo";
const FooterSection = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="grow bg-muted" />
      <footer>
        <Separator />
        <div className="w-full mx-auto">
          <div className="py-12 flex flex-col justify-start items-center">
            {/* Logo */}
            <Logo />
            <div className="h-4" />
            {/* <ul className="mt-6 flex items-center gap-4 flex-wrap">
              {footerLinks.map(({ title, href }) => (
                <li key={title}>
                  <a
                    href={href}
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul> */}
            <span className="pt-4 text-center text-muted-foreground">
              &copy; {new Date().getFullYear()}{" "}
              <a href="/" target="_blank">
                bandoso.yhcmute.com
              </a>
              <br />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterSection;
