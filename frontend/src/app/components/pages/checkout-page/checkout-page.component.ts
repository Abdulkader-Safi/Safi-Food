import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/shared/models/Order';
import { CartService } from '../../../services/cart.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css'],
})
export class CheckoutPageComponent {
  order: Order = new Order();
  checkoutForm!: FormGroup;

  constructor(
    private cartService: CartService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private toastrService: ToastrService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const cart = this.cartService.getCart();
    this.order.items = cart.items;
    this.order.totalPrice = cart.totalPrice;

    let { name, address } = this.userService.currentUser;
    this.checkoutForm = this.formBuilder.group({
      name: [name, Validators.required],
      address: [address, Validators.required],
    });
  }

  get fc() {
    return this.checkoutForm.controls;
  }

  createOrder() {
    if (this.checkoutForm.invalid) {
      this.toastrService.warning('Please fill the inputs', 'Invalid Inputs');
      return;
    }

    if (!this.order.addressLatLng) {
      this.toastrService.warning(
        'Please select location on the map',
        'Location'
      );
      return;
    }

    this.order.name = this.fc['name'].value;
    this.order.address = this.fc['address'].value;

    this.orderService.create(this.order).subscribe({
      next: () => {
        this.router.navigateByUrl('/payment');
      },
      error: (errorResponse) => {
        this.toastrService.error(errorResponse.error, 'Cart');
      },
    });
  }
}
