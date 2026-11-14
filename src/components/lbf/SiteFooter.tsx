import Link from "next/link";
import { Icon } from "./icons";
import { FooterLogoDrift } from "@/components/brand/FooterLogoDrift";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div>
            <Link className="brand" href="/">
              <Icon name="cap" size={26} />
              <span className="wm">
                Learn Being <span>Forward</span>
              </span>
            </Link>
            <p style={{ marginTop: 12, maxWidth: 280 }}>
              Placement-focused technical training for schools, colleges and corporate freshers.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/courses">Courses</Link></li>
              <li><Link href="/technologies">Technologies</Link></li>
              <li><Link href="/team">Trainers</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Partner with us</Link></li>
              <li><Link href="/auth">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="tel:+919972934418">+91 99729 34418</a></li>
              <li><a href="mailto:support@learnbeingforward.in">support@learnbeingforward.in</a></li>
            </ul>
          </div>
        </div>
      </div>
      <FooterLogoDrift />
      <div className="container">
        <div className="bottom" style={{ borderTop: "none", marginTop: 0 }}>
          <span>© {new Date().getFullYear()} Learn Being Forward</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
}
