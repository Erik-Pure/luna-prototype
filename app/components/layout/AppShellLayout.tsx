"use client";

import Link from "next/link";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import styles from "../../page.module.scss";

type SectionNavItem = {
  slug: string;
  label: string;
  icon: ReactNode;
  defaultMenuSlug: string;
};

type TopNavItem = {
  slug: string;
  label: string;
  hasMenu?: boolean;
};

type TopMenuOption = {
  slug: string;
  label: string;
  href?: string;
  endIcon?: "open_in_new";
};

type AppShellLayoutProps = {
  isSidebarCollapsed: boolean;
  sectionSlug: string;
  sectionDefinitions: SectionNavItem[];
  onNavigateSection: (section: string, defaultMenuSlug: string) => void;
  onToggleSidebar: () => void;
  leftTopMenuItems: TopNavItem[];
  rightTopMenuItems: TopNavItem[];
  isTopMenuItemActive: (item: TopNavItem) => boolean;
  onTopMenuClick: (item: TopNavItem, event: ReactMouseEvent<HTMLButtonElement>) => void;
  topMenuAnchorEl: HTMLElement | null;
  onCloseTopMenuDropdown: () => void;
  topMenuDropdownOptions: TopMenuOption[];
  topMenuDropdownOwnerSlug: string | null;
  menuSlug: string;
  onTopMenuOptionSelect: (option: TopMenuOption) => void;
  currentSectionLabel: string;
  currentMenuLabel: string;
  isCustomerDetailOpen: boolean;
  isCreatingCustomer: boolean;
  selectedCustomerName: string | null;
  isContractDetailOpen: boolean;
  isLineItemDetailOpen: boolean;
  selectedContractId: string | null;
  selectedLineItemId: string | null;
  isCreatingLineItem: boolean;
  contractListHref: string;
  contractDetailHref: string | null;
  isPriceListDetailOpen: boolean;
  isCreatingPriceList: boolean;
  selectedPriceListId: string | null;
  priceListHref: string;
  isPriceListRowDetailOpen: boolean;
  selectedPriceRowId: string | null;
  isCreatingPriceRow: boolean;
  priceListDetailHref: string | null;
  customerListHref: string;
  isAvropDetailOpen: boolean;
  selectedAvropsradId: string | null;
  isCreatingAvrop: boolean;
  returnLineItemId: string | null;
  lineItemDetailHref: string | null;
  isContainerRoute: boolean;
  isPrislistekalkylRoute: boolean;
  returnToPrislistekalkyl: boolean;
  prislistekalkylHref: string | null;
  children: ReactNode;
};

export function AppShellLayout({
  isSidebarCollapsed,
  sectionSlug,
  sectionDefinitions,
  onNavigateSection,
  onToggleSidebar,
  leftTopMenuItems,
  rightTopMenuItems,
  isTopMenuItemActive,
  onTopMenuClick,
  topMenuAnchorEl,
  onCloseTopMenuDropdown,
  topMenuDropdownOptions,
  topMenuDropdownOwnerSlug,
  menuSlug,
  onTopMenuOptionSelect,
  currentSectionLabel,
  currentMenuLabel,
  isCustomerDetailOpen,
  isCreatingCustomer,
  selectedCustomerName,
  isContractDetailOpen,
  isLineItemDetailOpen,
  selectedContractId,
  selectedLineItemId,
  isCreatingLineItem,
  contractListHref,
  contractDetailHref,
  isPriceListDetailOpen,
  isCreatingPriceList,
  selectedPriceListId,
  priceListHref,
  isPriceListRowDetailOpen,
  selectedPriceRowId,
  isCreatingPriceRow,
  priceListDetailHref,
  customerListHref,
  isAvropDetailOpen,
  selectedAvropsradId,
  isCreatingAvrop,
  returnLineItemId,
  lineItemDetailHref,
  isContainerRoute,
  isPrislistekalkylRoute,
  returnToPrislistekalkyl,
  prislistekalkylHref,
  children
}: AppShellLayoutProps) {
  return (
    <div className={styles.appShell}>
      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarMenu}>
          {sectionDefinitions
            .filter((section) => section.slug !== "system")
            .map((section) => (
              <button
                type="button"
                key={section.slug}
                className={`${styles.sidebarItemButton} ${section.slug === sectionSlug ? styles.sidebarItemActive : ""
                  }`}
                data-label={section.label}
                onClick={() => onNavigateSection(section.slug, section.defaultMenuSlug)}
              >
                <span className={styles.sidebarItemIcon}>{section.icon}</span>
                {!isSidebarCollapsed ? <span className={styles.sidebarItemText}>{section.label}</span> : null}
                {isSidebarCollapsed ? <span className={styles.sidebarItemTooltip}>{section.label}</span> : null}
              </button>
            ))}
        </div>

        <div className={styles.sidebarSpacer} />

        <div className={styles.sidebarBottomMenu}>
          {sectionDefinitions
            .filter((section) => section.slug === "system")
            .map((section) => (
              <button
                type="button"
                key={section.slug}
                className={`${styles.sidebarItemButton} ${section.slug === sectionSlug ? styles.sidebarItemActive : ""
                  }`}
                data-label={section.label}
                onClick={() => onNavigateSection(section.slug, section.defaultMenuSlug)}
              >
                <span className={styles.sidebarItemIcon}>{section.icon}</span>
                {!isSidebarCollapsed ? <span className={styles.sidebarItemText}>{section.label}</span> : null}
                {isSidebarCollapsed ? <span className={styles.sidebarItemTooltip}>{section.label}</span> : null}
              </button>
            ))}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <Avatar src="/luna-profile-avatar.png" alt="Jane Doe" variant="rounded" className={styles.userAvatar} />
            {!isSidebarCollapsed ? <Typography className={styles.userName}>Jane Doe</Typography> : null}
          </div>
        </div>
      </aside>

      <section className={styles.mainPanel}>
        <div className={styles.topNav}>
          <div className={styles.collapseButtonWrap}>
            <IconButton size="small" className={styles.collapseButton} onClick={onToggleSidebar}>
              <MenuOpenIcon
                className={`${styles.mainMenuToggleIcon} ${isSidebarCollapsed ? styles.mainMenuToggleIconClosed : styles.mainMenuToggleIconOpen
                  }`}
              />
            </IconButton>
          </div>
          {leftTopMenuItems.map((item) => (
            <Button
              key={item.slug}
              className={`${styles.topMenuItem} ${isTopMenuItemActive(item) ? styles.topMenuItemActive : ""}`}
              endIcon={item.hasMenu ? <KeyboardArrowDownIcon className={styles.menuArrowIcon} /> : undefined}
              aria-current={isTopMenuItemActive(item) ? "page" : undefined}
              onClick={(event) => onTopMenuClick(item, event)}
            >
              {item.label}
            </Button>
          ))}
          {rightTopMenuItems.length > 0 ? (
            <span className={styles.topMenuGroupDivider} aria-hidden="true">
              |
            </span>
          ) : null}
          {rightTopMenuItems.map((item) => (
            <Button
              key={item.slug}
              className={`${styles.topMenuItem} ${isTopMenuItemActive(item) ? styles.topMenuItemActive : ""}`}
              endIcon={<KeyboardArrowDownIcon className={styles.menuArrowIcon} />}
              aria-current={isTopMenuItemActive(item) ? "page" : undefined}
              onClick={(event) => onTopMenuClick(item, event)}
            >
              {item.label}
            </Button>
          ))}
          <div className={styles.topMenuSpacer} />

          <Menu
            anchorEl={topMenuAnchorEl}
            open={Boolean(topMenuAnchorEl)}
            onClose={onCloseTopMenuDropdown}
            slotProps={{ paper: { className: styles.topMenuDropdownPaper } }}
            MenuListProps={{ className: styles.topMenuDropdownList }}
          >
            {topMenuDropdownOptions.map((option) => (
              <MenuItem
                key={option.slug}
                className={`${styles.topMenuDropdownItem} ${option.slug === menuSlug && topMenuDropdownOwnerSlug ? styles.topMenuDropdownItemActive : ""}
                  ${option.endIcon === "open_in_new" ? styles.linkOutside : ""}
                }`}
                onClick={() => onTopMenuOptionSelect(option)}
              >
                <span className={styles.topMenuDropdownItemContent}>
                  <span>{option.label}</span>
                  {option.endIcon === "open_in_new" ? (
                    <OpenInNewIcon className={styles.topMenuDropdownItemIcon} fontSize="inherit" />
                  ) : null}
                </span>
              </MenuItem>
            ))}
          </Menu>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.breadcrumbs}>
            {sectionSlug === "system" ? (
              <Typography className={styles.breadcrumbActive}>{currentSectionLabel}</Typography>
            ) : (
              <>
                <Typography className={styles.breadcrumbMuted}>{currentSectionLabel}</Typography>
                <ChevronRightIcon className={styles.breadcrumbArrow} />
              </>
            )}
            {sectionSlug === "system" ? null : !isContractDetailOpen && !isPriceListDetailOpen && !isCustomerDetailOpen && !isCreatingCustomer && !isCreatingPriceList ? (
              menuSlug === "edi-lista" ? (
                <>
                  <Typography className={styles.breadcrumbMuted}>{currentMenuLabel}</Typography>
                  <ChevronRightIcon className={styles.breadcrumbArrow} />
                  <Typography className={styles.breadcrumbActive}>Ehandel kund / produkt</Typography>
                </>
              ) : (
                <Typography className={styles.breadcrumbActive}>{currentMenuLabel}</Typography>
              )
            ) : isCreatingCustomer ? (
              <>
                <Typography component={Link} href={customerListHref} className={styles.breadcrumbLinkButton}>
                  {currentMenuLabel}
                </Typography>
                <ChevronRightIcon className={styles.breadcrumbArrow} />
                <Typography className={styles.breadcrumbActive}>Ny kund</Typography>
              </>
            ) : isCreatingPriceList ? (
              <>
                <Typography component={Link} href={priceListHref} className={styles.breadcrumbLinkButton}>
                  {currentMenuLabel}
                </Typography>
                <ChevronRightIcon className={styles.breadcrumbArrow} />
                <Typography className={styles.breadcrumbActive}>Ny prislista</Typography>
              </>
            ) : isPriceListDetailOpen ? (
              <>
                <Typography component={Link} href={priceListHref} className={styles.breadcrumbLinkButton}>
                  {currentMenuLabel}
                </Typography>
                <ChevronRightIcon className={styles.breadcrumbArrow} />
                {isPrislistekalkylRoute ? (
                  <>
                    <Typography component={Link} href={priceListDetailHref ?? priceListHref} className={styles.breadcrumbLinkButton}>
                      {`Prislista ${selectedPriceListId}`}
                    </Typography>
                    <ChevronRightIcon className={styles.breadcrumbArrow} />
                    <Typography className={styles.breadcrumbActive}>Prislistekalkyl</Typography>
                  </>
                ) : isPriceListRowDetailOpen ? (
                  <>
                    <Typography component={Link} href={priceListDetailHref ?? priceListHref} className={styles.breadcrumbLinkButton}>
                      {selectedPriceListId === "new" ? "Ny prislista" : `Prislista ${selectedPriceListId}`}
                    </Typography>
                    {returnToPrislistekalkyl ? (
                      <>
                        <ChevronRightIcon className={styles.breadcrumbArrow} />
                        <Typography component={Link} href={prislistekalkylHref ?? priceListDetailHref ?? priceListHref} className={styles.breadcrumbLinkButton}>
                          Prislistekalkyl
                        </Typography>
                      </>
                    ) : null}
                    <ChevronRightIcon className={styles.breadcrumbArrow} />
                    <Typography className={styles.breadcrumbActive}>
                      {isCreatingPriceRow ? "Ny prislisterad" : `Prislisterad ${selectedPriceRowId}`}
                    </Typography>
                  </>
                ) : (
                  <Typography className={styles.breadcrumbActive}>
                    {selectedPriceListId === "new" ? "Ny prislista" : `Prislista ${selectedPriceListId}`}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Typography component={Link} href={isCustomerDetailOpen ? customerListHref : contractListHref} className={styles.breadcrumbLinkButton}>
                  {currentMenuLabel}
                </Typography>
                <ChevronRightIcon className={styles.breadcrumbArrow} />
                {isCustomerDetailOpen ? (
                  <Typography className={styles.breadcrumbActive}>{selectedCustomerName}</Typography>
                ) : isContainerRoute ? (
                  <>
                    <Typography component={Link} href={contractDetailHref ?? contractListHref} className={styles.breadcrumbLinkButton}>
                      Kontrakt {selectedContractId}
                    </Typography>
                    <ChevronRightIcon className={styles.breadcrumbArrow} />
                    <Typography className={styles.breadcrumbActive}>Container</Typography>
                  </>
                ) : isAvropDetailOpen ? (
                  <>
                    <Typography component={Link} href={contractDetailHref ?? contractListHref} className={styles.breadcrumbLinkButton}>
                      Kontrakt {selectedContractId}
                    </Typography>
                    {returnLineItemId ? (
                      <>
                        <ChevronRightIcon className={styles.breadcrumbArrow} />
                        <Typography component={Link} href={lineItemDetailHref ?? contractDetailHref ?? contractListHref} className={styles.breadcrumbLinkButton}>
                          Kontraktsrad {returnLineItemId}
                        </Typography>
                      </>
                    ) : null}
                    <ChevronRightIcon className={styles.breadcrumbArrow} />
                    <Typography className={styles.breadcrumbActive}>
                      {isCreatingAvrop ? "Ny avropsrad" : `Avropsrad ${selectedAvropsradId}`}
                    </Typography>
                  </>
                ) : isLineItemDetailOpen ? (
                  <>
                    <Typography component={Link} href={contractDetailHref ?? contractListHref} className={styles.breadcrumbLinkButton}>
                      Kontrakt {selectedContractId}
                    </Typography>
                    <ChevronRightIcon className={styles.breadcrumbArrow} />
                    <Typography className={styles.breadcrumbActive}>
                      {isCreatingLineItem ? "Ny kontraktsrad" : `Kontraktsrad ${selectedLineItemId}`}
                    </Typography>
                  </>
                ) : (
                  <Typography className={styles.breadcrumbActive}>Kontrakt {selectedContractId}</Typography>
                )}
              </>
            )}
          </div>

          <div className={styles.contentBody}>{children}</div>
        </div>
      </section>
    </div>
  );
}
