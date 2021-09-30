import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/client';
import styles from './sidenav.module.scss';

const SideNav = () => {
  const [session, loading] = useSession();

  if (loading) return '';
  let links = [
    <Link href="/" key="home">
      <li className="list-group-item">Home</li>
    </Link>,
  ];
  if (session && session.user.sundaeUser.creator) {
    links = links.concat([
      <Link href="/series" key="series">
        <li className="list-group-item">Series</li>
      </Link>,
      <Link href="/workshops" key="workshops">
        <li className="list-group-item">Workshops</li>
      </Link>,
      <Link href="/notifications" key="notiications">
        <li className="list-group-item">Notifications</li>
      </Link>,
      <Link href="/payments" key="payments">
        <li className="list-group-item">Payments</li>
      </Link>,
      <Link href="/subscribers" key="subscribers">
        <li className="list-group-item">My Users</li>
      </Link>,
    ]);
  }
  links.push(
    <Link href="/settings" key="settings">
      <li className="list-group-item">Settings</li>
    </Link>
  );
  links.push(
    <Link href="/subscriptions" key="subscriptions">
      <li className="list-group-item">Subscriptions</li>
    </Link>
  );
  // links.push(
  //     <Link href="/quizzes" key="quizzes">
  //       <li className="list-group-item">Quizzes</li>
  //     </Link>
  // );
  return (
    <div className={styles.sidenav_container}>
      <ul className="list-group list-group-flush">
        {links}
      </ul>
    </div>
  );
};

export default SideNav;
